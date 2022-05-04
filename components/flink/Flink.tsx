type Props = {
  href: string,
  children: React.ReactNode
}

export default function Flink(props: Props) {
  return (
    <a href={props.href} target="_blank" referrer="noreferrer">
      <span style={{textDecoration: "underline"}}>
        {props.children}
      </span>
      ↗️
    </a>
  )
}
