import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LinkedList, renderLinkedList } from '../dataStructures/LinkedList';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useControls, button } from 'leva';  // Import controls from Leva


const LinkedListPage = () => {
    const linkedListRef = useRef(new LinkedList());
    const [sceneRef, setSceneRef] = useState(null);

    const {None} = useControls({
        "reset camera": button(() => {
            console.log(sceneRef);
        }),
    });


    useEffect(() => {
        const scene = new THREE.Scene();
        setSceneRef(scene);

        const light = new THREE.PointLight(0xffffff, 1500);
        light.position.set(10, 10, 20);
        scene.add(light);

        // Camera setup
        // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
        camera.position.z = 10; // Ensure camera is placed far enough back

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Call your renderLinkedList function here to add the 3D objects
        renderLinkedList(scene, linkedListRef.current);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
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
    }, []);

    const updateScene = () => {
        if (!sceneRef) return;

        // Remove everything before re-rendering
        while (sceneRef.children.length > 0) {
            sceneRef.remove(sceneRef.children[0]);
        }

        const light = new THREE.PointLight(0xffffff, 1500);
        light.position.set(10, 10, 20);
        sceneRef.add(light);

        renderLinkedList(sceneRef, linkedListRef.current);
    };

    const [inputValue, setInputValue] = useState('');

    return (
        <div>
            <h1 style={{ position: 'absolute', top: '10px', left: '10px', color: '#fff' }}>
                Linked list visualization
            </h1>

            {/* Controls UI */}
            <div style={{ position: 'absolute', top: '60px', left: '10px', color: '#fff' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Node value"
                />
                <button onClick={() => {
                    linkedListRef.current.append(inputValue);
                    updateScene();
                }}>
                    Add Node
                </button>
                <button onClick={() => {
                    linkedListRef.current.delete(inputValue);
                    updateScene();
                }}>
                    Delete Node
                </button>
            </div>
        </div>
    );
};


export default LinkedListPage;