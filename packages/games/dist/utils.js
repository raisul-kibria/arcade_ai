export const createGameConfig = (containerId) => ({
    width: 800,
    height: 600,
    parent: containerId,
    backgroundColor: '#000000',
    pixelArt: true
});
export const getRandomColor = () => {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    return colors[Math.floor(Math.random() * colors.length)];
};
export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};
export const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};
//# sourceMappingURL=utils.js.map