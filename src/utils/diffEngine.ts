
type DiffResult = {
    haschanged: boolean,
    difference: null | number,
    old: String | number,
    new: String | number
}

type TypeofData = {
    oldvalue: String | number,
    newvalue: String | number
}


function toNumber(value: String | number): number | null {
    if (typeof (value) == "number") return value;

    const cleaned = value.replace(/\p{Sc}/gu, "").replace(/,/g, "").trim();

    const num = Number(cleaned);
    return isNaN(num) ? null : num;
}

export function compareNewOldData({ oldvalue, newvalue }: TypeofData): DiffResult {
    const result: DiffResult = {
        haschanged: false,
        difference: null,
        old: oldvalue,
        new: newvalue
    }

    if (oldvalue === newvalue) {
        return result;
    }

    // trying numeric comaprison
    const oldnum = toNumber(oldvalue);
    const newNum = toNumber(newvalue);

    if (oldnum !== null && newNum !== null) {
        if (oldnum == 0) {
            throw new Error("cannot calculate percentage from zero!")
        }

        const change = ((newNum - oldnum) / Math.abs(oldnum)) * 100;
        result.haschanged = true;
        result.difference = change;
        return result;
    }

    // now comparing string ;

    const oldstr = String(oldvalue).trim().toLowerCase();
    const newstr = String(newvalue).trim().toLowerCase();

    if (oldstr !== newstr) {
        result.haschanged = true;
    }
    return result;
}
