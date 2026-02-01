
interface PhoneIconProps {
    width?: number;
    height?: number;
    position: "vertical" | "horizontal";
}
export const PhoneIcon = ({ width = 200, height = 200, position }: PhoneIconProps) => {
    return (
        <svg fill="#ffff" width={width} height={height} className={position === "horizontal" ? "rotate-90" : ""} version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 568.07 568.07" xmlSpace="preserve">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <g>
                    <g>
                        <path
                            d="M385.517,0H182.543c-23.706,0-42.993,19.288-42.993,42.993v482.083c0,23.707,19.288,42.994,42.993,42.994h202.983 c23.705,0,42.993-19.287,42.993-42.994V42.993C428.51,19.288,409.222,0,385.517,0z M182.543,14.344h202.983 c14.563,0,26.497,10.968,28.285,25.063H154.257C156.036,25.312,167.97,14.344,182.543,14.344z M414.167,525.076 c0,15.799-12.853,28.65-28.649,28.65H182.543c-15.797,0-28.649-12.852-28.649-28.65v-3.871h260.282v3.871H414.167z M414.167,514.033H153.894V46.579h260.282v467.454H414.167z">
                        </path>
                        <circle cx="194.478" cy="28.076" r="6.713"></circle>
                        <path
                            d="M311.274,21.363h-54.104c-3.3,0-5.002,2.496-3.815,5.565l0.172,0.43c1.195,3.07,4.829,5.565,8.128,5.565h46.637 c3.299,0,6.636-2.591,7.468-5.776C316.572,23.945,314.563,21.363,311.274,21.363z">
                        </path>
                    </g>
                </g>
            </g>
        </svg>
    )
}
