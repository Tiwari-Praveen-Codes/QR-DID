import { sha256 } from '@noble/hashes/sha2.js';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
  index?: number;
}

export interface MerkleProof {
  root: string;
  leaf: string;
  leafIndex: number;
  path: { hash: string; position: 'left' | 'right' }[];
  fieldName: string;
  fieldValue: string;
}

export interface MerkleTree {
  root: string;
  leaves: string[];
  tree: MerkleNode;
}

function hashData(data: string): string {
  const encoded = new TextEncoder().encode(data);
  return toHex(sha256(encoded));
}

function hashPair(left: string, right: string): string {
  return hashData(left + right);
}

export function buildMerkleTree(fields: { name: string; value: string }[]): MerkleTree {
  const leaves = fields.map(f => hashData(`${f.name}:${f.value}`));

  // Pad to power of 2
  while (leaves.length < Math.pow(2, Math.ceil(Math.log2(leaves.length || 1)))) {
    leaves.push(hashData('EMPTY'));
  }

  function buildTree(hashes: string[], startIdx: number): MerkleNode {
    if (hashes.length === 1) {
      return { hash: hashes[0], index: startIdx };
    }
    const mid = Math.floor(hashes.length / 2);
    const left = buildTree(hashes.slice(0, mid), startIdx);
    const right = buildTree(hashes.slice(mid), startIdx + mid);
    return {
      hash: hashPair(left.hash, right.hash),
      left,
      right,
    };
  }

  const tree = buildTree(leaves, 0);
  return { root: tree.hash, leaves, tree };
}

export function generateMerkleProof(
  tree: MerkleTree,
  fieldIndex: number,
  fieldName: string,
  fieldValue: string
): MerkleProof {
  const leaf = tree.leaves[fieldIndex];
  const path: { hash: string; position: 'left' | 'right' }[] = [];

  function findPath(node: MerkleNode, targetIdx: number, depth: number, rangeStart: number, rangeEnd: number): boolean {
    if (!node.left && !node.right) {
      return node.index === targetIdx;
    }
    const mid = Math.floor((rangeStart + rangeEnd) / 2);
    if (targetIdx < mid && node.left && node.right) {
      if (findPath(node.left, targetIdx, depth + 1, rangeStart, mid)) {
        path.push({ hash: node.right.hash, position: 'right' });
        return true;
      }
    } else if (node.right && node.left) {
      if (findPath(node.right, targetIdx, depth + 1, mid, rangeEnd)) {
        path.push({ hash: node.left.hash, position: 'left' });
        return true;
      }
    }
    return false;
  }

  findPath(tree.tree, fieldIndex, 0, 0, tree.leaves.length);

  return { root: tree.root, leaf, leafIndex: fieldIndex, path, fieldName, fieldValue };
}

export function verifyMerkleProof(proof: MerkleProof): boolean {
  let currentHash = proof.leaf;
  for (const step of proof.path) {
    currentHash = step.position === 'right'
      ? hashPair(currentHash, step.hash)
      : hashPair(step.hash, currentHash);
  }
  return currentHash === proof.root;
}
