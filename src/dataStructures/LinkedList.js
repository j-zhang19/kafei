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
}

export function renderLinkedList(scene) {
    // Example: hardcoded list for now
    const linkedList = new LinkedList();
    linkedList.append(0);
    linkedList.append(1);
    linkedList.append(2);
    linkedList.append(3);
    linkedList.append(4);

    const values = linkedList.getValues();

    let current = linkedList.head;
    let x = -6;
    const y = 0;

    const material = new THREE.MeshToonMaterial({ color: 0x00ffcc });
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);

    while (current) {
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, 0);
        scene.add(sphere);

        // Optionally: draw a line to the next node
        if (current.next) {
            const points = [];
            points.push(new THREE.Vector3(x, y, 0));
            points.push(new THREE.Vector3(x + 3, y, 0));

            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
        }


        current = current.next;
        x += 3;
    }
}
