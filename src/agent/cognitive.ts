import { Agent } from ".";
import inform from "../helper/console";
import { IModel } from "../llms";

class Cognitive {
  private shortMemory: any[] = [];
  private longMemory: any[] = [];

  private llm: IModel;

  private agent: Agent;

  private actions = [];

  constructor(llm: IModel, agent: Agent) {
    this.llm = llm;
    this.agent = agent;
  }

  private getMySelf() {
    const prompt = `
        ## Who i am?
        - Name: ${this.agent.name}
        - Role: ${this.agent.role}
        - Goal: ${this.agent.goal}

        ## How is my memory?
        - Short Memory: ${JSON.stringify(this.shortMemory)}
        - Long Memory: ${JSON.stringify(this.longMemory)}
    `

    return prompt
  }

  async thought({
    context,
    toThought,
  }: {
    context: string;
    toThought: string;
  }) {
    const prompt = `
            ## You are the cognitive brain area from =>
            ${this.getMySelf()}

            ## What is the current situation?
            - Context: ${context}

            ## What i need to though?
            - ${toThought}

            ** you will respond with a thought, you will make an observation about situation and simulate a brain thought. **
            ### Output Format ###
            {
                "thought": "your thought about situation here",
                "observation": "your observation about all situation here",
                "action": "your action", // optional, only if you want to use it. if not, put 'none'
            }
        `;

    const response = await this.llm.prompt(prompt);

    inform.agent(`Thought: ${response.thought}`);
    inform.agent(`Observation: ${response.observation}`);

    this.shortMemory.push(response);

    this.longMemory.push(context);

    if (response.action != "none") {
      const prompt = `
        ${this.getMySelf()}

        ## What is the current situation?
        - Context: ${context}

        ## My tools
        - ${JSON.stringify(this.agent.tools)}

        ## What i need to ACT, what is my action?
        - ${response.action}

        ### Output Format ###
        {
            "thought": "your thought here",
            "observation": "your observation here",
            "currentAction": "current action",
            "tool": "tool name",
            "toolParams": "tool params"
        }
      `

      const res = await this.llm.prompt(prompt);

      inform.agent(`Action: ${res.currentAction}`);
      inform.agent(`Tool: ${res.tool}`);
      inform.agent(`Tool Params: ${JSON.stringify(res.toolParams)}`);

      if(this.shortMemory.length > 4) {
        this.shortMemory.shift();
      }
    }

    return response;
  }

  async preThought({ context = "You are a person, a real one. you can do anything", prompt }: { context?: string, prompt: string }) {
    const preT = `
        ${this.getMySelf()}

        ## What is the current context?
        - Context: ${context}

        ## What the envoironment is says to me?
        - ${prompt}

        OBJECTIVE: What i need to though? about the situation

        ### Output Format ###
        {
            "observation": "your observation here",
            "thought": "what do you need to though?",         
        }
    `;

    const thought = await this.llm.prompt(preT);

    return thought;
  }
}

export { Cognitive };
