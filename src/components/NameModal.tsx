import React, { useState } from 'react';

interface FioModalProps {
    initialName1: string;
    initialName2: string;
    onApply: (name1: string, name2: string) => void;
    onClose: () => void;
}

const NameModal: React.FC<FioModalProps> = ({ initialName1, initialName2, onApply, onClose }) => {
    const [fio1, setFio1] = useState(initialName1);
    const [fio2, setFio2] = useState(initialName2);

    const handleApply = () => {
        onApply(fio1, fio2);
        onClose();
    };

    return (
        <div className="fio_modal_overlay">
            <div className="fio_cont">
                <p className="fiotitle">Фамилия, Имя и Отчество:</p>
                <div className="field-wrap">
                    <input
                        className="txtinput"
                        type="text"
                        value={fio1}
                        onChange={(e) => setFio1(e.target.value)}
                    />
                </div>

                <p className="fiotitle">Фамилия, Имя и Отчество:</p>
                <div className="field-wrap">
                    <input
                        className="txtinput"
                        type="text"
                        value={fio2}
                        onChange={(e) => setFio2(e.target.value)}
                    />
                </div>

                <div className="apply_btn" onClick={handleApply}>
                    <p className="apply_btn_txt">Применить</p>
                </div>
            </div>
        </div>
    );
};

export default NameModal;


