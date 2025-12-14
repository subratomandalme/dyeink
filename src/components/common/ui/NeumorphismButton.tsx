import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './NeumorphismButton.css';
interface NeumorphismButtonProps {
    text?: string;
    to?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    className?: string; 
    style?: React.CSSProperties;
}
const NeumorphismButton: React.FC<NeumorphismButtonProps> = ({
    text = "Start Writing",
    to,
    onClick,
    icon,
    type = 'button',
    className = '',
    style = {}
}) => {
    const content = (
        <>
            {icon === undefined ? <ArrowRight size={18} /> : icon}
            <span>{text}</span>
        </>
    );
    if (to) {
        return (
            <Link to={to} className={`neu-btn ${className}`} style={style}>
                {content}
            </Link>
        );
    }
    return (
        <button type={type} onClick={onClick} className={`neu-btn ${className}`} style={style}>
            {content}
        </button>
    );
};
export default NeumorphismButton;
 
