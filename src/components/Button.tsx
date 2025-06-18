import styles from "../styles/Button.module.css"

interface Props {
  children?: preact.ComponentChildren
  onClick?: (e:MouseEvent) => any
  id?: string
  className?: string
  target?: string
  url: string
}

export default function Button({ children, onClick,url, target, className, ...rest }:Props) {
  
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    window.location.href = url;
  };
  return (
    
<a
  href={url}
  
  onClick={handleClick}
  data-astro-prefetch
  class={`py-1 min-h-14 px-3 md:px-8 w-fit rounded-xl transition-all duration-800 ease-in-out hover:scale-105 tex__glowing flex items-center  justify-center
    
    ${styles.button}
    ${className ?? ''}`
  }
  {...rest}
>
  {children}
</a>

  )
}
