export class HeartRate {

    id: number;
    dateRecorded: Date;
    heartRateValue: number;

    constructor(id: number, dateRecorded: Date, heartRateValue: number) {
        this.id = id;
        this.dateRecorded = dateRecorded;
        this.heartRateValue = heartRateValue;
    }

}
