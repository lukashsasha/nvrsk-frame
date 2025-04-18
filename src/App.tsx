import React, { useState, useRef } from 'react';
import './App.css';
import topImage from './images/header.png';
import bottomImage from './images/footer.png';
import buttonFrame from './images/btn_frame.png';
import buttonFIO from './images/btn_fio.png';
import buttonSave from './images/btn_save.png';

import CanvasEditor, { CanvasEditorRef } from "./components/CanvasEditor";
import frame1 from './images/frame_mask_1.png';
import frame2 from './images/frame_mask_2.png';
import NameModal from "./components/NameModal";
import FrameModal from './components/FrameModal';

export interface FrameData {
    frame: string;
    baseWidth: number;
    baseHeight: number;
    imageSize: { width: number; height: number };
    relativeClips: { x: number; y: number }[][];
    relativeButtonPositions: { x: number; y: number }[];
    relativeFioPositions: { x: number; y: number }[];
    fioFrameSize: { width: number, height: number }
}

function App() {
    const canvasEditorRef = useRef<CanvasEditorRef>(null);
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    const [showNameModal, setShowNameModal] = useState(false);
    const [showFrameModal, setShowFrameModal] = useState(false);

    const frame1Data: FrameData = {
        frame: frame1,
        baseWidth: 724,
        baseHeight: 1024,
        imageSize: { width: 300 / 724, height: 600 / 1024 },
        relativeClips: [
            [
                { x: 16 / 724, y: 253 / 1024 },
                { x: 328 / 724, y: 206 / 1024 },
                { x: 392 / 724, y: 624 / 1024 },
                { x: 79 / 724, y: 672 / 1024 }
            ],
            [
                { x: 368 / 724, y: 237 / 1024 },
                { x: 686 / 724, y: 279 / 1024 },
                { x: 631 / 724, y: 697 / 1024 },
                { x: 312 / 724, y: 657 / 1024 },
                { x: 316 / 724, y: 640 / 1024 },
                { x: 394 / 724, y: 626 / 1024 },
                { x: 354 / 724, y: 338 / 1024 }
            ]
        ],
        relativeButtonPositions: [
            { x: 200 / 724, y: 440 / 1024 },
            { x: 500 / 724, y: 440 / 1024 }
        ],
        relativeFioPositions: [
            { x: 200 / 724, y: 710 / 1024 },
            { x: 470 / 724, y: 710 / 1024 }
        ],
        fioFrameSize: { width: 200, height: 170 }
    };

    const frame2Data: FrameData = {
        frame: frame2,
        baseWidth: 1024,
        baseHeight: 724,
        imageSize: { width: 250 / 724, height: 680 / 1024 },
        relativeClips: [
            [
                { x: 60 / 724, y: 150 / 1024 },
                { x: 317 / 724, y: 150 / 1024 },
                { x: 317 / 724, y: 830 / 1024 },
                { x: 60 / 724, y: 830 / 1024 }
            ],
            [
                { x: 403 / 724, y: 150 / 1024 },
                { x: 660 / 724, y: 150 / 1024 },
                { x: 660 / 724, y: 830 / 1024 },
                { x: 403 / 724, y: 830 / 1024 }
            ]
        ],
        relativeButtonPositions: [
            { x: 188.5 / 724, y: 490 / 1024 },
            { x: 531.5 / 724, y: 490 / 1024 }
        ]
        ,
        relativeFioPositions: [
            { x: 180 / 724, y: 840 / 1024 },
            { x: 540 / 724, y: 840 / 1024 }
        ],
        fioFrameSize: { width: 200, height: 80 }
    };

    const [frameData, setFrameData] = useState<FrameData>(frame1Data);

    const handleFrameChange = () => {
        setShowFrameModal(true);
    };

    const handleAddName = () => {
        setShowNameModal(true);
    };


    const handleSave = () => {
        if (canvasEditorRef.current) {
            canvasEditorRef.current.saveCanvas();
        } else {
            console.warn('canvasEditorRef is null');
        }
    };

    return (
        <div className="App">
            <img className='topImage' src={topImage} alt="" />
            <img className='bottomImage' src={bottomImage} alt="" />
            <div className='container'>
                <CanvasEditor ref={canvasEditorRef} frameData={frameData} name1={name1} name2={name2} />
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
                    frames={[frame1Data.frame, frame2Data.frame]} // можно добавить больше
                    onSelect={(selectedIndex) => {
                        setFrameData(selectedIndex === 0 ? frame1Data : frame2Data);
                        setShowFrameModal(false);
                    }}
                    onClose={() => setShowFrameModal(false)}
                />
            )}
        </div>
    );
}

export default App;
