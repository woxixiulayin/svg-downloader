import { useMemo } from "react"
import useAppStore from "../store"
import SvgView from "./SvgView"

export default () => {
  const state = useAppStore(state => state)

  const svgDataList = useMemo(() => {
    if (!Array.isArray(state.originSvgList)) return []
    return state.originSvgList
  }, [state.originSvgList])

  return <div>
    {svgDataList.map(item => <SvgView svgData={item} />)}
  </div>
}