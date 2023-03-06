<script lang="ts">
    import YAML from "yaml";
    import { render as renderDiagram } from "./utils/mermaid";
    import type { MermaidConfig } from "mermaid";
    import { Job } from "./utils/job";
    import { Graph } from "./utils/graph";

    let container: HTMLDivElement;
    let workflowName: string = "";
    let branchOrTag: string = "dev";
    let yamlCode: string = "";
    let mermaidCode: string = "";
    const mermaidConfig: MermaidConfig = {
        startOnLoad: true,
        theme: "default",
    };

    function yamlToMermaid(yml: any): string {
        const jobs: Job[] = yml.workflows[workflowName].jobs.map(job => Job.fromConfig(job))

        const graph = new Graph<Job>();
        jobs.forEach((job) => graph.addNode(job.name, job));
        jobs.forEach((job) => {
            job.requires.forEach(req => {
                graph.addEdge(req, job.name)
            })
        });
        console.log(graph.nodes);
        graph.nodes.forEach(node => {
            console.log(`${node.id}: ${node.data.runOnBranchOrTag(branchOrTag)}`);
            if (!node.data.runOnBranchOrTag(branchOrTag)) {
                graph.removeNode(node.id)
            }
        })

        let converted = ["flowchart LR"];
        graph.nodes.forEach((node) => {
            converted.push(...node.data.toMermaid());
        });

        return converted.join("\n");
    }

    async function onChanged() {
        const yml = YAML.parse(yamlCode);
        mermaidCode = yamlToMermaid(yml);
        console.log(mermaidCode);

        const graphDiv = document.getElementById("graph-div");
        const { svg, bindFunctions } = await renderDiagram(
            mermaidConfig,
            mermaidCode,
            "graph-div"
        );
        if (svg.length > 0) {
            container.innerHTML = svg;
            console.log({ svg });
            const graphDiv = document.getElementById("graph-div");
            if (!graphDiv) {
                throw new Error("graph-div not found");
            }
            graphDiv.setAttribute("height", "100%");
            graphDiv.style.maxWidth = "100%";
            if (bindFunctions) {
                bindFunctions(graphDiv);
            }
        }
    }
</script>

<dev class="flex">
<label
    >workflow:
    <input
        bind:value={workflowName}
        placeholder="workflow name to visualize"
        on:change={onChanged}
    />
</label>
<label
    >branch or tag:
    <input
        bind:value={branchOrTag}
        placeholder="branch or tag name"
        on:change={onChanged}
    />
</label></dev>
<textarea
    bind:value={yamlCode}
    on:change={onChanged}
    placeholder="Paste your config.yml here"
/>

<div bind:this={container} />

<style>
    .flex {
        display: flex;
        justify-content: space-around;
    }
    input {
        width: 20em;
        margin-bottom: 1em;
    }
    textarea {
        width: 100%;
        height: 200px;
    }
</style>
