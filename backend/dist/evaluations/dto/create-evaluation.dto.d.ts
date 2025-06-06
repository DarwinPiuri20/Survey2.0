export declare class CreateAnswerDto {
    questionId: string;
    numericValue?: number;
    textValue?: string;
    booleanValue?: boolean;
    optionValue?: string;
}
export declare class CreateEvaluationDto {
    sellerId: string;
    storeId: string;
    campaignId?: string;
    answers: CreateAnswerDto[];
}
