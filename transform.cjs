// constEnumTransformer.js
const ts = require("typescript");

function constEnumTransformer(program, opts) {
  return (context) => {
    return (sourceFile) => {
      function visit(node) {
        // Find standard EnumDeclaration nodes
        if (ts.isEnumDeclaration(node)) {
          // Add the 'const' modifier if it doesn't already have one
          const hasConst = node.modifiers?.some(
            (m) => m.kind === ts.SyntaxKind.ConstKeyword
          );

          if (!hasConst) {
            const constModifier = ts.factory.createModifier(
              ts.SyntaxKind.ConstKeyword
            );
            const updatedModifiers = ts.factory.createNodeArray([
              constModifier,
              ...(node.modifiers || []),
            ]);

            return ts.factory.updateEnumDeclaration(
              node,
              updatedModifiers,
              node.name,
              node.members
            );
          }
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(sourceFile, visit);
    };
  };
}

module.exports = constEnumTransformer;