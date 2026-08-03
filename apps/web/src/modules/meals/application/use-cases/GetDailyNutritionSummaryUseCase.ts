import type {
  DailyNutritionSummary,
  DailyNutritionSummaryGateway,
} from '../ports/DailyNutritionSummaryGateway';

export class GetDailyNutritionSummaryUseCase {
  constructor(
    private readonly dailyNutritionSummaryGateway: DailyNutritionSummaryGateway,
  ) {}

  execute(profileId: string, date: string): Promise<DailyNutritionSummary> {
    return this.dailyNutritionSummaryGateway.getByProfileAndDate(
      profileId,
      date,
    );
  }
}
