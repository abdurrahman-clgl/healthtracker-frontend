export class SleepPattern {

    id: number;
    dateRecorded: Date;
    sleepDuration: number;
    lightSleepDuration: number;
    deepSleepDuration: number ;
    interruptions: number;
    sleepQuality: number;


    constructor(id: number, dateRecorded: Date, sleepDuration: number, lightSleepDuration: number, deepSleepDuration: number, interruptions: number, sleepQuality: number) {
        this.id = id;
        this.dateRecorded = dateRecorded;
        this.sleepDuration = sleepDuration;
        this.lightSleepDuration = lightSleepDuration;
        this.deepSleepDuration = deepSleepDuration;
        this.interruptions = interruptions;
        this.sleepQuality = sleepQuality;
    }
}