export const getCroppedImg = (imageSrc, crop, rotation = 0) => {
    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = () => resolve(image);
            image.onerror = (e) => reject(e);
            image.src = url;
        });

    return new Promise(async (resolve, reject) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const safeArea = Math.max(image.width, image.height) * 2;
        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
            image,
            (safeArea - image.width) / 2,
            (safeArea - image.height) / 2
        );

        const data = ctx.getImageData(crop.x, crop.y, crop.width, crop.height);

        canvas.width = crop.width;
        canvas.height = crop.height;

        ctx.putImageData(data, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) return reject("Canvas is empty");
            const fileUrl = URL.createObjectURL(blob);
            resolve(fileUrl);
        }, "image/jpeg");
    });
};