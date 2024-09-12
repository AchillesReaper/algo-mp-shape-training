export interface df_row{
    trade_date: string,
    trade_month: string,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
    skewness: number,
    kurtosis: number,
    val: number,
    vah: number,
    spkl: number,
    spkh: number,
    pocs: number[],
    tpo_count: {[key: string]: number},
    code: string
    shape: ShapeType
}

export type ShapeType = '' | 'b' | 'p' | 'n'|'double' | 'box' | 'undefined_shape'