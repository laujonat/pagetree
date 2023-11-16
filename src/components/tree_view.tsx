import { useEffect, useState } from "react";

import { buildTree } from "../sum";

function TreeView(props) {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [treeHtml, setTreeHtml] = useState<string>("Loading...");
  useEffect(() => {
    async function generateAndSendMessage() {
      try {
        const newTreeHtml = await buildTree(props.nodes);

        setTreeHtml(newTreeHtml as string);
        setLoaded(true);
      } catch (error) {
        console.error("Error generating tree:", error);
      }
    }

    generateAndSendMessage();
  }, []);

  return (
    <section className="wrapper">
      <div className="tree" id="tree">
        {!loaded ? (
          <h1 className="loading">Loading...</h1>
        ) : (
          <ul dangerouslySetInnerHTML={{ __html: treeHtml }} />
        )}
      </div>
    </section>
  );
}

export default TreeView;
