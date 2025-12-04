// 创建一个简单的立方体GLB模型用于测试
const fs = require('fs');
const path = require('path');

// 简单的立方体顶点数据
const cubeVertices = new Float32Array([
  // Front face
  -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,
  // Back face
  -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5,
  // Top face
  -0.5,  0.5, -0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5, -0.5,
  // Bottom face
  -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5,  0.5, -0.5, -0.5,  0.5,
  // Right face
   0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,
  // Left face
  -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5
]);

const cubeNormals = new Float32Array([
  // Front face
   0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,
  // Back face
   0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,
  // Top face
   0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,
  // Bottom face
   0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,
  // Right face
   1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,
  // Left face
  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0
]);

const cubeIndices = new Uint16Array([
  0,  1,  2,    0,  2,  3,    // front
  4,  5,  6,    4,  6,  7,    // back
  8,  9,  10,   8,  10, 11,   // top
  12, 13, 14,   12, 14, 15,   // bottom
  16, 17, 18,   16, 18, 19,   // right
  20, 21, 22,   20, 22, 23    // left
]);

// 创建一个简单的GLTF格式的立方体
const gltf = {
  asset: {
    version: "2.0",
    generator: "Manual Test Model"
  },
  scene: 0,
  scenes: [{
    nodes: [0]
  }],
  nodes: [{
    mesh: 0
  }],
  meshes: [{
    primitives: [{
      attributes: {
        POSITION: 0,
        NORMAL: 1
      },
      indices: 2,
      material: 0
    }]
  }],
  accessors: [
    {
      bufferView: 0,
      componentType: 5126, // FLOAT
      count: 24,
      type: "VEC3",
      max: [0.5, 0.5, 0.5],
      min: [-0.5, -0.5, -0.5]
    },
    {
      bufferView: 1,
      componentType: 5126, // FLOAT
      count: 24,
      type: "VEC3"
    },
    {
      bufferView: 2,
      componentType: 5123, // UNSIGNED SHORT
      count: 36,
      type: "SCALAR"
    }
  ],
  materials: [{
    name: "CubeMaterial",
    pbrMetallicRoughness: {
      baseColorFactor: [0.2, 0.5, 0.8, 1.0], // 蓝色
      metallicFactor: 0.3,
      roughnessFactor: 0.7
    }
  }],
  bufferViews: [
    {
      buffer: 0,
      byteOffset: 0,
      byteLength: cubeVertices.byteLength
    },
    {
      buffer: 0,
      byteOffset: cubeVertices.byteLength,
      byteLength: cubeNormals.byteLength
    },
    {
      buffer: 0,
      byteOffset: cubeVertices.byteLength + cubeNormals.byteLength,
      byteLength: cubeIndices.byteLength
    }
  ],
  buffers: [{
    byteLength: cubeVertices.byteLength + cubeNormals.byteLength + cubeIndices.byteLength,
    uri: "data:application/octet-stream;base64," + Buffer.concat([
      Buffer.from(cubeVertices.buffer),
      Buffer.from(cubeNormals.buffer),
      Buffer.from(cubeIndices.buffer)
    ]).toString('base64')
  }]
};

// 写入GLTF文件
const gltfPath = path.join(__dirname, '../public/test-models/cube.gltf');
fs.writeFileSync(gltfPath, JSON.stringify(gltf, null, 2));

console.log('Created test cube model:', gltfPath);