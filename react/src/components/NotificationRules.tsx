import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import s from './NotificationRules.module.scss';
import {toast} from "react-toastify";
import type {RuleDraft} from "../types.ts";
import api from "../api.ts";
import {CancelCircleIcon} from "../media/defaultIcons.tsx";


/* ───────────── Типы (подгоните под ваш API) ───────────── */

export type MatchField = 'organization' | 'name' | 'address';

export interface Rule extends RuleDraft {
  id: number | string;
  enabled: boolean;
}

/** Условие отбора без email: по нему считается предпросмотр */
export type PreviewQuery = Omit<RuleDraft, 'email'>;

export interface RulePreview {
  /** Сколько терминалов подходит под условие сейчас */
  count: number;
  /** Названия (достаточно первых нескольких) */
  names: string[];
  /** Дата первого письма, 'YYYY-MM-DD'. null, если слать нечего */
  firstSend: string | null;
}

export interface NotificationRulesProps {

  /** Сохранить правило. Бросьте Error, текст покажется под формой */
  /** Необязательно: предпросмотр «сколько терминалов подходит». Вызывается с задержкой 300 мс */
  onPreview?: (query: PreviewQuery, signal: AbortSignal) => Promise<RulePreview>;
}

/* ───────────── Справочники ───────────── */

const FIELDS: Record<MatchField, string> = {
  organization: 'Организация',
  name: 'Название',
  address: 'Адрес',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatIso = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
};
const isPast = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`) <= new Date();

/* ───────────── Состояние формы ───────────── */

interface FormState {
  email: string;
  field: MatchField;
  value: string;
  skipInactive: boolean;
}

const INITIAL: FormState = {
  email: '',
  field: 'organization',
  value: '',
  skipInactive: true,
};

type PreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: RulePreview };

/* ───────────── Компонент ───────────── */

export default function NotificationRules({ onPreview }: NotificationRulesProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [day, setDay] = useState<number>(5);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<PreviewState>({ status: 'idle' });

  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const query = useMemo<PreviewQuery>(
    () => ({
      matchField: form.field,
      matchValue: form.value.trim(),
      dayBefore: day,
      skipInactive: form.skipInactive,
    }),
    [form.field, form.value, form.skipInactive, day],
  );
  const draft: RuleDraft = { email: form.email.trim(), ...query };

  // Предпросмотр: запрос с задержкой, предыдущий отменяется
  const previewRef = useRef(onPreview);

  const canPreview = Boolean(onPreview) && query.matchValue !== '' && query.dayBefore > 0;

  useEffect(() => {
    if (!canPreview || !previewRef.current) {
      setPreview({ status: 'idle' });
      return;
    }
    const ctrl = new AbortController();
    setPreview({ status: 'loading' });
    const timer = setTimeout(() => {
      previewRef.current?.(query, ctrl.signal)
        .then((data) => !ctrl.signal.aborted && setPreview({ status: 'ready', data }))
        .catch(() => !ctrl.signal.aborted && setPreview({ status: 'error' }));
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [canPreview, query]);

  const onCreate = async () => {
    try {
      const res = await api.post("/notify/create", draft)
      if(res.status !== 201) throw new Error("Неизвестная ошибка")
      setRules((prv) => [...prv, res.data])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось сохранить правило');
    }
  }

  const onDelete = async (id: number) => {
    try {
      const res = await api.delete(`/notify/delete/${id}`);
      if (res.status >= 200 && res.status < 300) {
        setRules(prev => prev.filter(r => r.id !== id));
        toast.success("Правило удалено")
      } else throw new Error("Ошибка сервера")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось сохранить правило');
    }
  }

  const onToggle = async (id: number) => {
    try{
      const rule = rules.find(rule => rule.id === id);
      if (!rule) throw new Error("Объект не найден")
      const next = !rule.enabled;
      const res = await api.patch(`/notify/update/${id}`, {enabled: next})
      if(res.status == 200) {
        setRules(prev =>
            prev.map(r => (r.id === id ? { ...r, enabled: next } : r))
        );
      } else {
        throw new Error("Ошибка сервера")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось сохранить правило');
    }
  }


  async function save() {
    if (!EMAIL_RE.test(draft.email)) {
      toast.error('Проверьте email');
      return;
    }
    else if (!draft.matchValue) {
      toast.error('Укажите условие для отбора терминалов');
      return;
    }
    else if (draft.dayBefore <= 0) {
      toast.error('Выберите хотя бы один срок');
      return;
    }


    setSaving(true);
    try {
      await onCreate();
      update({ email: '', value: '' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось сохранить правило');
    } finally {
      setSaving(false);
    }
  }

  function renderPreview() {
    if (!onPreview) return null;
    if (!query.matchValue) return <small>Введите условие, чтобы увидеть, какие терминалы подойдут.</small>;
    if (preview.status === 'loading' || preview.status === 'idle') return <small>Считаем…</small>;
    if (preview.status === 'error') return <small>Не удалось получить предпросмотр.</small>;

    const { count, names, firstSend } = preview.data;
    if (!count) {
      return (
        <>
          <b>Подходящих терминалов нет</b>
          <small>Проверьте условие.</small>
        </>
      );
    }
    return (
      <>
        <b>Сейчас подходит: {count}</b>
        <small>
          {names.slice(0, 3).join('; ')}
          {count > 3 ? ` и ещё ${count - 3}` : ''}
        </small>
        {firstSend && <small>Первое письмо: {isPast(firstSend) ? 'при ближайшей проверке' : formatIso(firstSend)}</small>}
      </>
    );
  }

  useEffect(() => {
    const getRules = async () => {
      try{
        const { data } = await api.get("/notify/list")
        if(!data) throw new Error("Notify not found");
        setRules(data)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Не удалось сохранить правило');
      }
    }
    getRules();
  }, []);

  const getDaysWord = (n: number): string => {
    const abs = Math.abs(n);
    const lastTwo = abs % 100;
    const last = abs % 10;

    if (lastTwo >= 11 && lastTwo <= 14) return "дней";
    if (last === 1) return "день";
    if (last >= 2 && last <= 4) return "дня";
    return "дней";
  };

  return (
    <div className={s.cols}>
      {/* ───── Форма ───── */}
      <div className={s.card}>
        <h2>Новое правило</h2>

        <div className={s.stack}>
          <label className={s.field}>
            Кому отправлять (email)
            <input
              className={s.input}
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="sklad@example.ru"
              inputMode="email"
              autoComplete="off"
            />
          </label>

          <div className={s.field}>
            Отбор по
            <div className={s.two}>
              <select
                className={s.input}
                aria-label="Поле"
                value={form.field}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => update({ field: e.target.value as MatchField })}
              >
                {(Object.keys(FIELDS) as MatchField[]).map((k) => (
                  <option key={k} value={k}>{FIELDS[k]}</option>
                ))}
              </select>
            </div>
            Содержит
            <input
              className={s.input}
              aria-label="Значение"
              value={form.value}
              onChange={(e) => update({ value: e.target.value })}
              placeholder="ООО Первый"
              autoComplete="off"
            />
          </div>

          <div>
            <div className={s.label}>За сколько дней предупредить</div>
            <div className={s.custom}>
              <input
                className={s.input}
                value={day}

                onChange={(e) => setDay(Number(e.target.value))}
                placeholder="1 день"
                inputMode="numeric"
              />

            </div>
          </div>

          <label className={s.check}>
            <input type="checkbox" checked={form.skipInactive} onChange={(e) => update({ skipInactive: e.target.checked })} />
            Не писать про терминалы на складе, сломанные и удалённые
          </label>

          {onPreview && <div className={s.preview}>{renderPreview()}</div>}

          <button type="button" className={s.primary} disabled={saving} onClick={save}>
            {saving ? 'Сохраняем…' : 'Добавить правило'}
          </button>
        </div>

        <details className={s.details}>
          <summary>Что уйдёт на сервер</summary>
          <pre>{JSON.stringify(draft, null, 2)}</pre>
        </details>
      </div>

      {/* ───── Список правил ───── */}
      <div className={s.card}>
        <h2>Активные правила</h2>

        {!rules.length && <div className={s.empty}>Правил пока нет. Добавьте первое слева.</div>}

        {rules.map((r) => (
          <div key={r.id} className={s.rule}>
            <div>
              <div className={s.email}>{r.email}</div>

              <div className={s.pills}>
                {r.dayBefore} {getDaysWord(r.dayBefore)}
                {r.skipInactive && <span className={s.muted}>без склада и удалённых</span>}
              </div>
              <div className={s.muted}>
                <span className={s.muted}>Поиск по полю {FIELDS[r.matchField]}: {r.matchValue}</span>
              </div>
            </div>

            <div className={s.actions}>
              <label className={s.switch}>
                <input type="checkbox" role="switch" aria-label="Включено" checked={r.enabled} onChange={() => onToggle(Number(r.id))} />
                <i />
              </label>
              <button type="button" className={s.del} aria-label="Удалить правило" onClick={() => onDelete(Number(r.id))}><CancelCircleIcon/></button>
            </div>
          </div>
        ))}

        <p className={s.note}>
          Терминалы подбираются в момент отправки, поэтому новые кассы, подходящие под условие, подхватываются сами. Письмо
          одно на правило: в нём список всех терминалов с подходящим сроком.
        </p>
      </div>
    </div>
  );
}