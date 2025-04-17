import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import addButton from '../images/btn_add.png';
import addButtonActive from '../images/btn_add_active.png';
import deleteButton from '../images/btn_delete.png'
import deleteButtonActive from '../images/btn_delete_active.png'
import rotateButton from '../images/btn_rotate.png'
import rotateButtonActive from '../images/btn_rotate_active.png'
import { FrameData } from '../App';

interface CanvasEditorProps {
    frameData: FrameData;
    name1: string;
    name2: string;

}

interface UploadedImage {
    img: HTMLImageElement;
    x: number;
    y: number;
}

export interface CanvasEditorRef {
    saveCanvas: () => void;
}


const CanvasEditor = forwardRef(({ frameData, name1, name2 }: CanvasEditorProps, ref) => {
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

    const {
        frame,
        baseWidth,
        baseHeight,
        imageSize,
        relativeClips,
        relativeButtonPositions,
        relativeFioPositions,
        fioFrameSize
    } = frameData;



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
            x: btn.x * canvasWidth - size / 2,
            y: btn.y * canvasHeight - size / 2,
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

    const draw = (options?: { forceBaseSize?: boolean }) => {
        const canvas = canvasRef.current;
        const mask = maskImage.current;
        if (!canvas || !mask) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const maskAspectRatio = mask.width / mask.height;
        let maxAvailableWidth = options?.forceBaseSize ? baseWidth : window.innerWidth;
        let maxAvailableHeight = options?.forceBaseSize ? baseHeight : window.innerHeight;

        let canvasWidth = maxAvailableWidth;
        let canvasHeight = canvasWidth / maskAspectRatio;

        if (canvasHeight > maxAvailableHeight) {
            canvasHeight = maxAvailableHeight;
            canvasWidth = canvasHeight * maskAspectRatio;
        }

        if (canvasWidth > baseWidth) canvasWidth = baseWidth;
        if (canvasHeight > baseHeight) canvasHeight = baseHeight;

        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        const dpr = 1;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        uploadedImages.forEach((item, i) => {
            if (!item) return;

            const shape = getAbsoluteCoords(relativeClips[i], canvas.width, canvas.height);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(shape[0].x, shape[0].y);
            shape.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
            // ctx.closePath();
            // ctx.strokeStyle = 'black';
            // ctx.lineWidth = 2;
            ctx.stroke();
            ctx.clip();

            const drawWidth = imageSize.width * canvas.width;
            const drawHeight = imageSize.height * canvas.height;

            const dx = item.x * canvas.width;
            const dy = item.y * canvas.height;

            const imgAspect = item.img.width / item.img.height;
            const frameAspect = drawWidth / drawHeight;

            let finalWidth = drawWidth;
            let finalHeight = drawHeight;
            let offsetX = dx;
            let offsetY = dy;

            if (imgAspect > frameAspect) {
                finalHeight = drawWidth / imgAspect;
                offsetY = dy + (drawHeight - finalHeight) / 2;
            } else {
                finalWidth = drawHeight * imgAspect;
                offsetX = dx + (drawWidth - finalWidth) / 2;
            }

            ctx.drawImage(item.img, offsetX, offsetY, finalWidth, finalHeight);
            ctx.restore();
        });

        ctx.drawImage(mask, 0, 0, canvasWidth, canvasHeight);

        uploadedImages.forEach((img, i) => {
            if (!img) {
                const { x, y, size } = getButtonRect(i, canvas.width, canvas.height);
                const icon = hoveredButtonIndex === i ? addIconsActive.current[i] : addIcons.current[i];

                if (icon instanceof HTMLImageElement && icon.complete && icon.naturalWidth > 0) {
                    ctx.drawImage(icon, x, y, size, size);
                } else if (icon) {
                    icon.onload = () => {
                        ctx.drawImage(icon, x, y, size, size);
                        draw();
                    };
                }
            }
        });

        // Текст

        const drawFio = (name: string, index: number) => {
            const pos = relativeFioPositions[index];
            const x = pos.x * canvasWidth;
            const y = pos.y * canvasHeight;
        
            const boxWidth = fioFrameSize.width * (canvasWidth / baseWidth);
            const boxHeight = fioFrameSize.height * (canvasHeight / baseHeight);
        
            const maxFontSize = 30 * (canvasHeight / baseHeight);
            const minFontSize = 10 * (canvasHeight / baseHeight);
            const lineSpacingRatio = 1.2;
            const maxLines = 3;
        
            // ctx.strokeStyle = 'red';
            // ctx.lineWidth = 2;
            // ctx.strokeRect(x - boxWidth / 2, y, boxWidth, boxHeight);
        
            const words = name.trim().split(/\s+/);
            let fontSize = maxFontSize;
            let lines: string[] = [];
        
            const buildLines = (size: number): string[] => {
                ctx.font = `bold ${size}px Arial`;
                const result: string[] = [];
                let currentLine = '';
        
                for (const word of words) {
                    const testLine = currentLine ? `${currentLine} ${word}` : word;
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > boxWidth && currentLine) {
                        result.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                }
        
                if (currentLine) result.push(currentLine);
                return result;
            };
        
            // Подбор размера шрифта
            while (fontSize >= minFontSize) {
                lines = buildLines(fontSize);
                const totalHeight = lines.length * fontSize * lineSpacingRatio;
        
                const longestLineWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
        
                if (totalHeight <= boxHeight && longestLineWidth <= boxWidth && lines.length <= maxLines) {
                    break;
                }
                fontSize -= 1;
            }
        
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
        
            const totalTextHeight = lines.length * fontSize * lineSpacingRatio;
            const startY = y + (boxHeight - totalTextHeight) / 2;
        
            lines.forEach((line, i) => {
                ctx.fillText(line, x, startY + i * fontSize * lineSpacingRatio);
            });
        };
         

        
        

        drawFio(displayName1, 0);
        drawFio(displayName2, 1);

    };



    useEffect(() => {
        draw();
    }, [displayName1, displayName2, uploadedImages, hoveredButtonIndex]);


    //Upload buttons
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
                                        x: relativeButtonPositions[i].x - imageSize.width / 2,
                                        y: relativeButtonPositions[i].y - imageSize.height / 2
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

    //Move images
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            uploadedImages.forEach((img, i) => {
                if (!img) return;

                const imgWidth = imageSize.width * canvasWidth;
                const imgHeight = imageSize.height * canvasHeight;

                const absX = img.x * canvasWidth;
                const absY = img.y * canvasHeight;

                if (x >= absX && x <= absX + imgWidth && y >= absY && y <= absY + imgHeight) {
                    setDragIndex(i);
                    setOffset({
                        x: x - absX,
                        y: y - absY
                    });
                }
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (dragIndex === null) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            setUploadedImages(prev => {
                const updated = [...prev];
                const img = updated[dragIndex];
                if (img) {
                    updated[dragIndex] = {
                        ...img,
                        x: (x - offset.x) / canvasWidth,
                        y: (y - offset.y) / canvasHeight
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


    useImperativeHandle(ref, () => ({
        saveCanvas: () => {
            const canvas = canvasRef.current;
            if (!canvas || !maskImage.current) return;

            const prevWidth = canvas.width;
            const prevHeight = canvas.height;
            const prevStyleWidth = canvas.style.width;
            const prevStyleHeight = canvas.style.height;

            canvas.width = baseWidth;
            canvas.height = baseHeight;
            canvas.style.width = `${baseWidth}px`;
            canvas.style.height = `${baseHeight}px`;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            draw({ forceBaseSize: true }); // перерисовать в базовом размере

            const link = document.createElement('a');
            link.download = 'image.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

            // вернуть размеры
            canvas.width = prevWidth;
            canvas.height = prevHeight;
            canvas.style.width = prevStyleWidth;
            canvas.style.height = prevStyleHeight;
            draw(); // снова отрисовать под экран
        }
    }));

    return <canvas ref={canvasRef} className="canvas" />;
});

export default CanvasEditor;
