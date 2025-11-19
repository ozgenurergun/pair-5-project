//bura jwtye göre tasarlanır
export interface UserState{
    isLoggedIn: boolean;
    user?: UserModel;
}

export interface UserModel{
    sub: string;
    roles: string[];
    firstname?: string;
}