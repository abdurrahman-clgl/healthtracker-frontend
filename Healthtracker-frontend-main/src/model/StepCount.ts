export class StepCount {
    id: number;
    dateRecorded: Date;
    stepCount: number;
    targetStepCount: number;

    constructor(
        id: number,
        dateRecorded: Date,
        stepCount: number,
        targetStepCount: number
    ) {
        this.id = id;
        this.dateRecorded = dateRecorded;
        this.stepCount = stepCount;
        this.targetStepCount = targetStepCount;
    }
}
