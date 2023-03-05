<script lang="ts">
    import YAML from "yaml";
    import { render as renderDiagram } from "./utils/mermaid";
    import type { MermaidConfig } from "mermaid";
    import { Job } from "./utils/job";

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
        console.log(yml.workflows[workflowName].jobs)
        const availableJobs: Job[] = yml.workflows[workflowName].jobs //
            .map((j) => Job.fromConfig(j)) //
            .filter(job => job.runOnBranchOrTag(branchOrTag));

        // requiresがavailableに存在しないJobを連鎖的に消していく

        let converted = ["flowchart LR"];
        availableJobs.forEach(job => {
            console.log(job)
            converted.push(...job.toMermaid())
        })

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
</label>
<textarea
    bind:value={yamlCode}
    on:change={onChanged}
    placeholder="Paste your config.yml here"
/>

<div bind:this={container} />

<style>
    input {
        width: 20em;
        margin-bottom: 1em;
    }
    textarea {
        width: 100%;
        height: 200px;
    }
</style>
