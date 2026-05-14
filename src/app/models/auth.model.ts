export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address: string;
    city: string;
}
export interface LoginDto {
    email: string;
    password: string;
}

export interface UserResponse {
    email: string;
    name: string;
    token: string;
}