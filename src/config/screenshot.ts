export const parameters = [
    'url', 
    'width', 
    'height', 
    'format'
] as const;

export const defaults = {
    url: 'https://picsum.photos/800/600', 
    width: 800, 
    height: 600, 
    format: 'jpeg'
} as const; 