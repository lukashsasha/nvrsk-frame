import React, { useState } from 'react';
import './App.css';
import topImage from './images/header.png';
import bottomImage from './images/footer.png';
import buttonFrame from './images/btn_frame.png';
import buttonFIO from './images/btn_fio.png';
import buttonSave from './images/btn_save.png';

import CanvasEditor from "./components/CanvasEditor";
import frame1 from './images/frame_mask_1.png';
import frame2 from './images/frame_mask_2.png';
import NameModal from "./components/NameModal";
import FrameModal from './components/FrameModal';

function App() {
    const [frame, setFrame] = useState(frame1);
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    const [showNameModal, setShowNameModal] = useState(false);
    const [showFrameModal, setShowFrameModal] = useState(false);

    const handleFrameChange = () => {
        setShowFrameModal(true);
    };

    const handleAddName = () => {
        setShowNameModal(true);
    };


    const handleSave = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'canvas-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="App">
            <img className='topImage' src={topImage} alt="" />
            <img className='bottomImage' src={bottomImage} alt="" />
            <div className='container'>
                <CanvasEditor frame={frame} name1={name1} name2={name2} />
                <div className='menu'>
                    <div className='button' onClick={handleFrameChange}>
                        <img src={buttonFrame} alt="" />
                        <span>Выбрать рамку</span>
                    </div>
                    <div className='button' onClick={handleAddName}>
                        <img src={buttonFIO} alt="" />
                        <span>Добавить ФИО</span>
                    </div>
                    <div className='button' onClick={handleSave}>
                        <img src={buttonSave} alt="" />
                        <span>Сохранить фото</span>
                    </div>
                </div>
            </div>
            {showNameModal && (
                <NameModal
                    initialName1={name1}
                    initialName2={name2}
                    onApply={(fio1, fio2) => {
                        setName1(fio1);
                        setName2(fio2);
                    }}
                    onClose={() => setShowNameModal(false)}
                />
            )}
            {showFrameModal && (
                <FrameModal
                    frames={[frame1, frame2]} // можно добавить больше
                    onSelect={(newFrame) => {
                        setFrame(newFrame);
                        setShowFrameModal(false);
                    }}
                    onClose={() => setShowFrameModal(false)}
                />
            )}
        </div>
    );
}

export default App;
