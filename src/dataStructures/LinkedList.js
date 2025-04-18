import * as THREE from 'three';

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

export class LinkedList {
    constructor() { this.head = null; }

    append(value) {
        if (!value) { return; }
        const newNode = new Node(value);
        if (!this.head) {
            this.head = newNode;
            return;
        }

        let current = this.head;
        while (current.next) { current = current.next; }
        current.next = newNode;
    }

    delete(value) {
        if (!value) { return; }
        if (!this.head) { return; }

        let current = this.head;
        if (current.value === value) {
            this.head = current.next;
            return;
        }

        while (current.next && current.next.value !== value) {
            current = current.next;
        }

        if (current.next) { current.next = current.next.next; }
    }

    getValues() {
        const values = [];
        let current = this.head;

        while (current) {
            values.push(current.value);
            current = current.next;
        }

        return values;
    }

    clear() {
        this.head = null;
    }
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}


function makeLabelCanvas(text, size = 64, color = 'white', bgColor = 'transparent') {
    const scaleFactor = 4; // Increase for higher resolution
    const padding = 20;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const font = `${size}px bold Charter, sans-serif`;
    context.font = font;

    // Measure text
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const textHeight = size * 1.4; // Give a bit of vertical padding

    // Set canvas size based on text
    canvas.width = Math.pow(2, Math.ceil(Math.log2(textWidth + padding * 2))) * scaleFactor;
    canvas.height = Math.pow(2, Math.ceil(Math.log2(textHeight + padding * 2))) * scaleFactor;

    // Apply font again after resizing
    context.scale(scaleFactor, scaleFactor);
    context.font = font;
    context.textBaseline = 'middle';
    context.textAlign = 'center';


    // Optional: background
    if (bgColor !== 'transparent') {
        context.fillStyle = bgColor;
        roundRect(context, textWidth - padding*2, textHeight - padding*2, textWidth + padding * 5, textHeight + padding * 3, 24);
        context.fill();
    }

    // Draw the text
    context.fillStyle = color;
    context.fillText(text, canvas.width / (2 * scaleFactor), canvas.height / (2 * scaleFactor));



    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;



    return texture;
}

export function renderLinkedList(scene, linkedList) {
    if (!linkedList) { return; }

    let current = linkedList.head;
    let x = -6;
    const y = 0;

    while (current) {
        const texture = makeLabelCanvas(current.value, 64, 'white', 'green');

        const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const label = new THREE.Sprite(labelMaterial);
        const aspect = texture.image.width / texture.image.height;
        label.scale.set(2 * aspect, 2, 1);



        const node = new THREE.Object3D();
        node.position.set(x, y, 0)
        node.add(label);
        scene.add(node);

        if (current.next) {
            const dir = new THREE.Vector3(1, 0, 0);
            //normalize the direction vector (convert to vector of length 1)
            dir.normalize();

            const origin = new THREE.Vector3(x + .45, 0, 0);
            const length = 2.1;
            const hex = 0xffffff;

            const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, .3 * length);
            scene.add(arrowHelper);
        }


        current = current.next;
        x += 3;
    }
}