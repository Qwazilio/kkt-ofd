export interface TerminalEntity {
    id?: number
    uid_terminal: string
    kkt_model?: string
    organization?: string
    name_terminal: string
    name_store?: string
    reg_number?: string
    comment?: string
    address?: string
    active_card?: CardEntity
    cards?: CardEntity[]
    end_date_sub?: Date
    deleted?: boolean
    updated?: boolean
    stock?: boolean
    broken?: boolean
    notification?: string
    hasFN?: boolean
}

export interface CardEntity{
    id?: number
    uid_card: string
    end_date_card: Date
    terminal?: TerminalEntity
}

export interface CompanyEntity {
    id: number;
    nickname: string;
    name: string;
    token: string;
    terminals: TerminalEntity[];
}