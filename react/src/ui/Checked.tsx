import type {InputHTMLAttributes} from "react";

interface CheckedProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onChange" | "value">{
    value: boolean;
    setValue: (value: boolean) => void;
}
export default function Checked({value, setValue, ...rest}: CheckedProps) {
    return(
        <input
            {...rest}

            type={"checkbox"}
            checked={value}
            onChange={(event) => setValue(event.target.checked)}
        />)
}