export class BloodSugar {
    id: number;
    dateRecorded: Date;
    bloodSugarLevel: number;

    constructor(
        id: number,
        dateRecorded: Date,
        bloodSugarLevel: number
    ) {
        this.id = id;
        this.dateRecorded = dateRecorded;
        this.bloodSugarLevel = bloodSugarLevel;
    }
}
