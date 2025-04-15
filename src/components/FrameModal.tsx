import React from 'react';
import closeButton from '../images/ic_close.png'

interface FrameModalProps {
    frames: string[];
    onSelect: (frame: string) => void;
    onClose: () => void;
}

const FrameModal: React.FC<FrameModalProps> = ({ frames, onSelect, onClose }) => {
    return (
        <div className="frames_cont">
            <div className="center_cont2">
                {frames.map((frameSrc, index) => (
                    <div
                        key={index}
                        className="frchoose_btn"
                        onClick={() => onSelect(frameSrc)}
                    >
                        <img
                            className="frchoose_img"
                            src={frameSrc}
                            alt={`frame-${index}`}
                        />
                    </div>
                ))}
            </div>
            <div className="close_btn" onClick={onClose}>
                <img className="close_img" src={closeButton} alt="Закрыть"/>
            </div>
        </div>
    );
};

export default FrameModal;
