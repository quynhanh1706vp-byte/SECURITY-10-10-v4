import { TreeProps } from 'antd';

export function buildTree(
  data: any[],
  fieldNames: TreeProps['fieldNames'] = { title: 'name', key: 'id', children: 'children' },
): any[] {
  const idToNodeMap: Record<string, any> = {};
  const tree: any[] = [];

  // Prepare nodes and map by id
  data.forEach((item) => {
    idToNodeMap[item.id] = {
      key: fieldNames.key ? item[fieldNames.key] : item.id,
      title: fieldNames.title ? item[fieldNames.title] : item.name,
      children: [],
    };
  });

  // Build tree
  data.forEach((item) => {
    if (item.parentId) {
      idToNodeMap[item.parentId].children.push(idToNodeMap[item.id]);
    } else {
      tree.push(idToNodeMap[item.id]);
    }
  });

  return tree;
}

export const countTreeNodes = (nodes: any[] = []): number =>
  nodes.reduce((acc, node) => acc + 1 + (Array.isArray(node.children) ? countTreeNodes(node.children) : 0), 0);
