import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function isValidAge(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidAge',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string) {
                    if (!value) return true;
                    const date = new Date(value);
                    const now = new Date();
                    const age = now.getFullYear() - date.getFullYear();
                    return age >= 13 && age <= 120;
                },
                defaultMessage(args: ValidationArguments) {
                    return 'User must be between 13 and 120 years old';
                },
            },
        });
    };
}