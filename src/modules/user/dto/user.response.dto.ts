import { Expose, Transform } from "class-transformer";

export default class UserResponseDto {
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    userId: string;

    @Expose()
    fullName: string;

    @Expose()
    phoneNumber: string;

    @Expose()
    gender?: boolean;

    @Expose()
    dateOfBirth?: string;

    @Expose()
    avt?: string;

    @Expose()
    email: string;

    @Expose()
    username: string;
}
