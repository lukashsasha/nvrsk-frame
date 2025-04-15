import React, {useRef, useEffect, useState} from 'react';
import addButton from '../images/btn_add.png';
import addButtonActive from '../images/btn_add_active.png';
import deleteButton from '../images/btn_delete.png'
import deleteButtonActive from '../images/btn_delete_active.png'
import rotateButton from '../images/btn_rotate.png'
import rotateButtonActive from '../images/btn_rotate_active.png'

interface CanvasEditorProps {
    frame: string;
    name1: string;
    name2: string;
}

interface UploadedImage {
    img: HTMLImageElement;
    x: number;
    y: number;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({frame, name1, name2}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskImage = useRef<HTMLImageElement | null>(null);
    const addIcons = useRef<(HTMLImageElement | null)[]>([null, null]);
    const addIconsActive = useRef<(HTMLImageElement | null)[]>([null, null]);

    const [displayName1, setDisplayName1] = useState('Фамилия Имя Отчество');
    const [displayName2, setDisplayName2] = useState('Фамилия Имя Отчество');
    const [uploadedImages, setUploadedImages] = useState<(UploadedImage | null)[]>([null, null]);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [offset, setOffset] = useState({x: 0, y: 0});
    const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(null);

    const windows = useRef([
        {x: 80, y: 300, w: 200, h: 250},
        {x: 350, y: 300, w: 200, h: 250}
    ]);

    const customClips = [
        [{x: 17, y: 235}, {x: 287, y: 193}, {x: 341, y: 579}, {x: 68, y: 621}],
        [{x: 325, y: 222}, {x: 597, y: 257}, {x: 550, y: 648}, {x: 277, y: 610}, {x: 280, y: 595}, {
            x: 346,
            y: 586
        }, {x: 311, y: 312}]
    ];

    const buttonPositions = [
        {x: 130, y: 350},
        {x: 390, y: 350}
    ];

    const buttonSize = 100;

    useEffect(() => {
        if (name1.trim()) setDisplayName1(name1);
        if (name2.trim()) setDisplayName2(name2);
    }, [name1, name2]);

    useEffect(() => {
        const img = new Image();
        img.src = frame;
        img.onload = () => {
            maskImage.current = img;
            draw();
        };

        // preload button icons
        [0, 1].forEach(i => {
            const icon = new Image();
            icon.src = addButton;
            addIcons.current[i] = icon;

            const activeIcon = new Image();
            activeIcon.src = addButtonActive;
            addIconsActive.current[i] = activeIcon;
        });
    }, [frame]);

    const draw = () => {
        const canvas = canvasRef.current;
        const mask = maskImage.current;
        if (!canvas || !mask) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const {width, height} = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        uploadedImages.forEach((item, i) => {
            if (!item) return;
            const win = windows.current[i];
            const shape = customClips[i];

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(shape[0].x, shape[0].y);
            shape.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.clip();
            const imgAspect = item.img.width / item.img.height;
            const frameAspect = win.w / win.h;

            let drawWidth = win.w;
            let drawHeight = win.h;
            let dx = item.x;
            let dy = item.y;

// Вписываем изображение в рамку
            if (imgAspect > frameAspect) {
                // Изображение шире — подгоняем по ширине
                drawHeight = win.w / imgAspect;
                dy = item.y + (win.h - drawHeight) / 2;
            } else {
                // Изображение выше — подгоняем по высоте
                drawWidth = win.h * imgAspect;
                dx = item.x + (win.w - drawWidth) / 2;
            }

            ctx.drawImage(item.img, dx, dy, drawWidth, drawHeight);
            ctx.restore();
        });

        ctx.drawImage(mask, 0, 0, width, height);

        uploadedImages.forEach((img, i) => {
            if (!img) {
                const btn = buttonPositions[i];
                const icon = hoveredButtonIndex === i ? addIconsActive.current[i] : addIcons.current[i];
                if (icon?.complete) {
                    ctx.drawImage(icon, btn.x, btn.y, buttonSize, buttonSize);
                } else {
                    icon!.onload = () => ctx.drawImage(icon!, btn.x, btn.y, buttonSize, buttonSize);
                }
            }
        });

        ctx.fillStyle = 'black';
        ctx.font = 'bold 30px Arial';
        const baseY = height - 250;
        const lineHeight = 35;

        const drawFio = (name: string, x: number) => {
            const parts = name.trim().split(/\s+/);
            ctx.textAlign = 'center';
            parts.forEach((line, i) => {
                if(i <=2){
                    ctx.fillText(line, x, baseY + i * lineHeight);

                }
            });
        };

        drawFio(displayName1, 200);
        drawFio(displayName2, width - 200);
    };

    useEffect(() => {
        draw();
    }, [displayName1, displayName2, uploadedImages, hoveredButtonIndex]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            buttonPositions.forEach((btn, i) => {
                if (!uploadedImages[i]) {
                    if (x >= btn.x && x <= btn.x + buttonSize && y >= btn.y && y <= btn.y + buttonSize) {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (event) => {
                            const file = (event.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                                const img = new Image();
                                img.src = reader.result as string;
                                img.onload = () => {
                                    const newImg: UploadedImage = {
                                        img,
                                        x: windows.current[i].x,
                                        y: windows.current[i].y
                                    };
                                    setUploadedImages(prev => {
                                        const updated = [...prev];
                                        updated[i] = newImg;
                                        return updated;
                                    });
                                };
                            };
                            reader.readAsDataURL(file);
                        };
                        input.click();
                    }
                }
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            let hovered: number | null = null;
            buttonPositions.forEach((btn, i) => {
                if (!uploadedImages[i]) {
                    if (
                        x >= btn.x &&
                        x <= btn.x + buttonSize &&
                        y >= btn.y &&
                        y <= btn.y + buttonSize
                    ) {
                        hovered = i;
                    }
                }
            });

            if (hovered !== hoveredButtonIndex) {
                setHoveredButtonIndex(hovered);
            }
        };

        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mousemove', handleMouseMove);
        return () => {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [uploadedImages, hoveredButtonIndex]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            uploadedImages.forEach((img, i) => {
                if (!img) return;
                const win = windows.current[i];
                if (x >= img.x && x <= img.x + win.w && y >= img.y && y <= img.y + win.h) {
                    setDragIndex(i);
                    setOffset({x: x - img.x, y: y - img.y});
                }
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (dragIndex === null) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setUploadedImages(prev => {
                const updated = [...prev];
                const img = updated[dragIndex];
                const win = windows.current[dragIndex];
                if (img) {
                    updated[dragIndex] = {
                        ...img,
                        x: x - offset.x,
                        y: y - offset.y
                    };
                }
                return updated;
            });
        };

        const handleMouseUp = () => setDragIndex(null);

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [uploadedImages, dragIndex, offset]);

    return <canvas ref={canvasRef} className="canvas" width="600" height="900"/>;
};

export default CanvasEditor;
