import React, { useRef, useEffect, useState } from 'react';
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

const CanvasEditor: React.FC<CanvasEditorProps> = ({ frame, name1, name2 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskImage = useRef<HTMLImageElement | null>(null);
    const addIcons = useRef<(HTMLImageElement | null)[]>([null, null]);
    const addIconsActive = useRef<(HTMLImageElement | null)[]>([null, null]);

    const [displayName1, setDisplayName1] = useState('Фамилия Имя Отчество');
    const [displayName2, setDisplayName2] = useState('Фамилия Имя Отчество');
    const [uploadedImages, setUploadedImages] = useState<(UploadedImage | null)[]>([null, null]);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(null);

    const windows = useRef([
        { x: 80, y: 300, w: 200, h: 250 },
        { x: 350, y: 300, w: 200, h: 250 }
    ]);

    const baseWidth = 724;
    const baseHeight = 1024;

    const relativeClips = [
        [
            { x: 16 / baseWidth, y: 253 / baseHeight },
            { x: 328 / baseWidth, y: 206 / baseHeight },
            { x: 392 / baseWidth, y: 624 / baseHeight },
            { x: 79 / baseWidth, y: 672 / baseHeight }
        ],
        [
            { x: 368 / baseWidth, y: 237 / baseHeight },
            { x: 686 / baseWidth, y: 279 / baseHeight },
            { x: 631 / baseWidth, y: 697 / baseHeight },
            { x: 312 / baseWidth, y: 657 / baseHeight },
            { x: 316 / baseWidth, y: 640 / baseHeight },
            { x: 394 / baseWidth, y: 626 / baseHeight },
            { x: 354 / baseWidth, y: 338 / baseHeight }
        ]
    ];

    const relativeButtonPositions = [
        { x: 150 / baseWidth, y: 370 / baseHeight },
        { x: 450 / baseWidth, y: 370 / baseHeight }
    ];

    const relativeFioPositions = [
        { x: 200 / baseWidth, y: 750 / baseHeight },
        { x: 520 / baseWidth, y: 750 / baseHeight }
    ];

    const buttonSize = 100;

    const relativeButtonSize = buttonSize / baseWidth;


    const getAbsoluteCoords = (relativeCoords: { x: number, y: number }[], canvasWidth: number, canvasHeight: number) => {
        return relativeCoords.map(point => ({
            x: point.x * canvasWidth,
            y: point.y * canvasHeight
        }));
    };

    const getButtonRect = (
        i: number,
        canvasWidth: number,
        canvasHeight: number
    ) => {
        const btn = relativeButtonPositions[i];
        const size = relativeButtonSize * canvasWidth;

        return {
            x: btn.x * canvasWidth,
            y: btn.y * canvasHeight,
            size
        };
    };


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



        // 1. Получаем пропорции маски
        const maskAspectRatio = mask.width / mask.height;

        // 2. Получаем максимальные доступные размеры (с учётом padding/margins)
        const maxAvailableWidth = window.innerWidth;
        const maxAvailableHeight = window.innerHeight;

        // 3. Вычисляем оптимальные размеры Canvas с сохранением пропорций маски
        let canvasWidth = maxAvailableWidth;
        let canvasHeight = canvasWidth / maskAspectRatio;

        if (canvasHeight > maxAvailableHeight) {
            canvasHeight = maxAvailableHeight;
            canvasWidth = canvasHeight * maskAspectRatio;
        }

        // 3.1. Ограничиваем размеры до базовых
        if (canvasWidth > baseWidth) {
            canvasWidth = baseWidth;
            canvasHeight = baseWidth / maskAspectRatio;
        }

        if (canvasHeight > baseHeight) {
            canvasHeight = baseHeight;
            canvasWidth = baseHeight * maskAspectRatio;
        }

        // 4. Устанавливаем вычисленные размеры
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;

        // 5. Устанавливаем внутренний буфер (с учётом DPI для чёткости)
        const dpr = window.devicePixelRatio || 1;
        // const dpr = 1;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        ctx.scale(dpr, dpr);


        // 6. Очищаем и рисуем фон
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);


        // 7. Отрисовываем содержимое с новыми размерами
        uploadedImages.forEach((item, i) => {
            if (!item) return;
            const win = windows.current[i];

            const shape = getAbsoluteCoords(relativeClips[i], canvas.width, canvas.height);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(shape[0].x, shape[0].y);
            shape.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.clip();

            const imgAspect = item.img.width / item.img.height;
            const frameAspect = win.w / win.h;

            let drawWidth = win.w;
            let drawHeight = win.h;
            let dx = item.x;
            let dy = item.y;

            if (imgAspect > frameAspect) {
                drawHeight = win.w / imgAspect;
                dy = item.y + (win.h - drawHeight) / 2;
            } else {
                drawWidth = win.h * imgAspect;
                dx = item.x + (win.w - drawWidth) / 2;
            }

            ctx.drawImage(item.img, dx, dy, drawWidth, drawHeight);
            ctx.restore();
        });

        // 8. Накладываем маску (теперь она точно соответствует Canvas)
        ctx.drawImage(mask, 0, 0, canvasWidth, canvasHeight);

        // 9. Отрисовываем кнопки
        uploadedImages.forEach((img, i) => {
            if (!img) {

                const { x, y, size } = getButtonRect(i, canvas.width, canvas.height);

                const icon = hoveredButtonIndex === i
                    ? addIconsActive.current[i]
                    : addIcons.current[i];

                // Проверяем, что icon существует и является HTMLImageElement
                if (icon instanceof HTMLImageElement) {
                    if (icon.complete) {
                        // Дополнительная проверка для TypeScript
                        if (icon.naturalWidth > 0) {
                            ctx.drawImage(icon, x, y, size, size);
                        }
                    } else {
                        // Явно указываем тип для onload
                        icon.onload = () => {
                            ctx.drawImage(icon, x, y, size, size);

                            // Перерисовываем canvas после загрузки иконки
                            draw();
                        };
                    }
                }
            }
        });

        // 10. Отрисовываем текст
        ctx.fillStyle = 'black';

        const baseFontSize = 30; // исходный размер текста в px
        const baseLineHeight = 35; // базовый отступ между строками
        const scaledFontSize = baseFontSize * (canvasHeight / baseHeight);
        const scaledLineHeight = baseLineHeight * (canvasHeight / baseHeight);

        // применяем масштабированный шрифт
        ctx.font = `bold ${scaledFontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const drawFio = (name: string, index: number) => {
            const pos = relativeFioPositions[index];
            const x = pos.x * canvasWidth;
            const y = pos.y * canvasHeight;

            const parts = name.trim().split(/\s+/);
            parts.forEach((line, i) => {
                if (i <= 2) {
                    ctx.fillText(line, x, y + i * scaledLineHeight);
                }
            });
        };

        drawFio(displayName1, 0);
        drawFio(displayName2, 1);
    };


    useEffect(() => {
        draw();
    }, [displayName1, displayName2, uploadedImages, hoveredButtonIndex]);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;


            relativeButtonPositions.forEach((btn, i) => {
                if (!uploadedImages[i]) {
                    const { x, y, size } = getButtonRect(i, canvas.width, canvas.height);
                    if (clickX >= x && clickX <= x + size && clickY >= y && clickY <= y + size) {
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
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let hovered: number | null = null;
            relativeButtonPositions.forEach((btn, i) => {
                const { x, y, size } = getButtonRect(i, canvas.width, canvas.height);
                if (!uploadedImages[i]) {
                    if (
                        mouseX >= x &&
                        mouseX <= x + size &&
                        mouseY >= y &&
                        mouseY <= y + size
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
                    setOffset({ x: x - img.x, y: y - img.y });
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

    return <canvas ref={canvasRef} className="canvas" />;
};

export default CanvasEditor;
