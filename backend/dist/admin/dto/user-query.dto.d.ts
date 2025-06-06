export declare class UserQueryDto {
    search?: string;
    roleId?: string;
    active?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
