import { forwardRef, Ref } from 'react';
import Button, { ButtonProps } from '../button/Button';

export type PrimaryButtonProps = Omit<ButtonProps, 'color'>;

const MyKloudPrimaryButton = (props: PrimaryButtonProps, ref: Ref<HTMLButtonElement>) => {
    return <Button className="mykloud-login-btn" color="norm" ref={ref} {...props} />;
};

export default forwardRef<HTMLButtonElement, PrimaryButtonProps>(MyKloudPrimaryButton);