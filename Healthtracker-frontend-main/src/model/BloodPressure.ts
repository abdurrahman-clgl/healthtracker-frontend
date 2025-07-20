export class BloodPressure {
    id: number;
    dateRecorded: Date;
    systolicPressure: number;
    diastolicPressure: number;

    constructor(
        id: number,
        dateRecorded: Date,
        systolicPressure: number,
        diastolicPressure: number,
    )

    {
        this.id = id;
        this.dateRecorded = dateRecorded;
        this.systolicPressure = systolicPressure;
        this.diastolicPressure = diastolicPressure;

    }
}
