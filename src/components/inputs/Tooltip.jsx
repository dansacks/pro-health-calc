import React, { useState, useEffect, useRef } from 'react';

// Supports only <b>...</b> and newlines; anything else is shown as plain text.
const renderText = (text) =>
    text.split(/(<b>[\s\S]*?<\/b>)/).map((part, i) => {
        const bold = part.match(/^<b>([\s\S]*)<\/b>$/);
        const lines = (bold ? bold[1] : part).split('\n').flatMap((line, j) =>
            (j === 0 ? [line] : [<br key={`br-${i}-${j}`} />, line]));
        return bold ? <b key={i}>{lines}</b> : <React.Fragment key={i}>{lines}</React.Fragment>;
    });

const Tooltip = ({ tooltipText }) => {
    const [visible, setVisible] = useState(false);
    const tooltipRef = useRef(null);

    // Toggle visibility on click (for mobile)
    const handleTooltipClick = () => {
        setVisible(!visible);
    };

    // Hide the tooltip if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="tooltip-container" onClick={handleTooltipClick}>
            <span className="tooltip-icon">ℹ️</span>
            <div className={`tooltip-text ${visible ? 'visible' : ''}`}>{renderText(tooltipText)}</div>
        </div>
    );
};

export default Tooltip;