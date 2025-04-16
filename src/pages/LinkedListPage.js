import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { renderLinkedList } from '../dataStructures/LinkedList';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useControls, button } from 'leva';

const LinkedListPage = () => {
    const [nodes, setNodes] = useState([]);

    // Leva Controls for managing Linked List
    const { nodeValue, addNode, deleteNode } = useControls({
        nodeValue: { value: '', label: 'Node Value' },
        addNode: button(() => {
            // Add new node when button is clicked
            setNodes(prevNodes => [...prevNodes, nodeValue]);
            console.log('Node added:', nodeValue);
        }),
        deleteNode: button(() => {
            // Delete the last node when button is clicked
            setNodes(prevNodes => prevNodes.slice(0, -1));
            console.log('Node deleted');
        }),
    });

    useEffect(() => {
        const scene = new THREE.Scene();
        const light = new THREE.PointLight(0xffffff, 1500);
        light.position.set(10, 10, 20);
        scene.add(light);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 10; // Ensure camera is placed far enough back

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Call your renderLinkedList function here to add the 3D objects
        renderLinkedList(scene, nodes); // Pass `nodes` state to render the updated list

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Resize handling
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', onResize);
            document.body.removeChild(renderer.domElement);
        };
    }, [nodes]); // Re-run the effect whenever `nodes` changes

    return (
        <div>
            <h1 style={{ position: 'absolute', top: '10px', left: '10px', color: '#fff' }}>
                Linked list visualization
            </h1>
        </div>
    );
};

export default LinkedListPage;
