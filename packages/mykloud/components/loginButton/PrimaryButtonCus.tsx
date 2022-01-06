import { forwardRef, Ref } from 'react';
import Button, { ButtonProps } from '../../../components/components/button/Button';

export type PrimaryButtonProps = Omit<ButtonProps, 'color'>;

const PrimaryButton = (props: PrimaryButtonProps, ref: Ref<HTMLButtonElement>) => {
    return <Button className="mykloud_login_btn" color="norm" ref={ref} {...props} />;
};

export default forwardRef<HTMLButtonElement, PrimaryButtonProps>(PrimaryButton);