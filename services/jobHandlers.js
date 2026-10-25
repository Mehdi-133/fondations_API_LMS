
const jobHandlers = {
    inactiveLearnerReminder: async () => {
        console.log("[JOB] inactiveLearnerReminder executed");
        return {
            message: "Handler executed; reminder logic pending",
        };
    },

    trainerSummary: async () => {
        console.log("[JOB] trainerSummary executed");
        return {
            message: "Handler executed; summary logic pending",
        };
    },

    statsRefresh: async () => {
        console.log("[JOB] statsRefresh executed");
        return {
            message: "Handler executed; statistics logic pending",
        };
    },
};

module.exports = jobHandlers;
