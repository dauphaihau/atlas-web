import plslog from "plslog"

const isProduction = import.meta.env.PROD

plslog.configure({
  activeLevels: isProduction ? ["warn", "error"] : ["debug", "info", "warn", "error"],
  namespaces: import.meta.env.VITE_LOG_NAMESPACES,
  maxDepth: isProduction ? 3 : 10,
})

export default plslog
