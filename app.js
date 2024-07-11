const express = require("express");
const bodyParser = require("body-parser");
const axios=require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simulated createAffinityEntry function
async function createAffinityEntry(linkedinUrl,dealowner, funnel, priority,isoutbound) {
  // Replace this with your actual implementation
  // You can make API calls, process data, and perform necessary actions here
  
  const authToken = "HZ_-0KPGIwLM6kNctmCS9s5QSjHQmATRmf03FzmuqkA";
  const authconfig = {
    auth: {
      username: "",
      password: authToken,
    },
  };

  try {
    const usernameMatch = linkedinUrl.match(/\/in\/([^/]+)/);
    if (!usernameMatch || !usernameMatch[1]) {
      console.error("Invalid LinkedIn URL format");
      return;
    }
    const name = usernameMatch[1].split("-").join(" ");
    const testdup=await checkForDuplication(name);
    if(testdup){
        console.log("h")
        return "duplicate"
    }
    // Send POST request to create organization
    const organizationResponse = await axios.post(
      "https://api.affinity.co/organizations",
      {
        name: name,
      },
      authconfig
    );
    console.log("org done");

    const organizationId = organizationResponse.data.id;

    // Send POST request to create list entry
    const listEntryResponse = await axios.post(
      "https://api.affinity.co/lists/249971/list-entries",
      {
        entity_id: organizationId,
      },
      authconfig
    );

    console.log("List entry created successfully:", listEntryResponse.data);
    // const addrelationship= await axios.post(
    //     "https://api.affinity.co/field-values",
    //     {
    //         field_id:"3488053",
    //         entity_id:organizationId,
    //         list_entry_id:listEntryResponse.data.id,
    //         value:relationship
    //     },
    //     authconfig
    //   );

    const addowner= await axios.post(
        "https://api.affinity.co/field-values",
        {
            field_id:"4543463",
            entity_id:organizationId,
            list_entry_id:listEntryResponse.data.id,
            value:dealowner
        },
        authconfig
      );

      const addfunnel= await axios.post(
        "https://api.affinity.co/field-values",
        {
            field_id:"4543453",
            entity_id:organizationId,
            list_entry_id:listEntryResponse.data.id,
            value:funnel
        },
        authconfig
      );

      const addpriority= await axios.post(
        "https://api.affinity.co/field-values",
        {
            field_id:"4543450",
            entity_id:organizationId,
            list_entry_id:listEntryResponse.data.id,
            value:priority
        },
        authconfig
      );


      // const addoutbound= await axios.post(
      //   "https://api.affinity.co/field-values",
      //   {
      //       field_id:"3488055",
      //       entity_id:organizationId,
      //       list_entry_id:listEntryResponse.data.id,
      //       value:isoutbound
      //   },
      //   authconfig
      // );

    const addnote = await axios.post(
      "https://api.affinity.co/notes",
      {
        organization_ids: [organizationId],
        content: linkedinUrl,
      },
      authconfig
    );
    console.log("note added");

    // Return a result indicating success
    return "done";
  } catch (error) {
    console.error("Error:", error.message);
    throw error; // Rethrow the error for further handling
  }
}
async function checkForDuplication(username) {
    const authToken = "HZ_-0KPGIwLM6kNctmCS9s5QSjHQmATRmf03FzmuqkA";
    const authconfig = {
      auth: {
        username: "",
        password: authToken,
      },
    };
  
    try {
      // Send GET request to retrieve list entries
      const listEntriesResponse = await axios.get(
        "https://api.affinity.co/lists/249971/list-entries",
        authconfig
      );
  
      const existingEntries = listEntriesResponse.data;
  
      // Extract names from existing entries
      const existingNames = existingEntries.map((entry) =>
        entry.entity.name.toLowerCase()
      );
      console.log(existingNames);
      console.log(existingNames.includes(username))
      return existingNames.includes(username);
    } catch (error) {
      console.error("Error:", error.message);
      throw error; // Rethrow the error for further handling
    }
}

app.post("/affinityexten", async (req, res) => {
  const linkedinUrl = req.body.linkedinUrl;
  console.log(linkedinUrl)
  const dealowner = req.body.selectedDealOwner;
  // const relationship=req.body.selectedRelationship;
  const funnel = req.body.selectedFunnel;
  const priority = req.body.selectedPriority;
  // const isoutbound=req.body.isOutbound
  // console.log(isoutbound)

  try {
    const result = await createAffinityEntry(linkedinUrl,dealowner,funnel,priority);
    res.json({ result: result });
  } catch (error) {
    res.status(500).json({ result: "error", errorMessage: error.message });
  }
});

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

  