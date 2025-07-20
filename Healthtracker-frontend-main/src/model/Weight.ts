// src/model/Weight.ts
export class Weight {
    id: number;
    dateRecorded: Date;
    weight: number;
    height: number;
    weightGoal: number;
    weeklyGoal: number;

    constructor(id: number, dateRecorded: Date, weight: number, height: number, weightGoal: number, weeklyGoal: number) {
        this.id = id;
        this.dateRecorded = dateRecorded;
        this.weight = weight;
        this.height = height;
        this.weightGoal = weightGoal;
        this.weeklyGoal = weeklyGoal;
    }
}
