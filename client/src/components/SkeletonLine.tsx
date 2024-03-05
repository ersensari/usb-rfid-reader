type Props = {
  thick: boolean
}
const SkeletonLine = (props: Props) => {
  return (
    <div className="animate-pulse w-full justify-center flex">
      <div
        className={`w-3/4 px-2 bg-gray-200 rounded-full dark:bg-gray-700 ${
          props.thick ? 'h-4' : 'h-2'
        }`}
      />
    </div>
  )
}
export default SkeletonLine
