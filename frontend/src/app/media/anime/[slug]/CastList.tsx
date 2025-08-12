'use client';
import React from 'react';
import { useState } from "react";
import Image from 'next/image';

type CastListProps = {
    // Add props as needed, e.g. cast: Array<{ name: string; role: string; }>
};

const CastList: React.FC<CastListProps> = ({ cast }) => {
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? cast : cast.slice(0, 6);
    return (
        <div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 flex-wrap">
                {visible.map((member, i) => (
                    <div key={i} className="flex gap-10 justify-between">
                        <div className="flex gap-2">
                            {member.pivot.image_url && (
                                <Image
                                    src={`${member.pivot.image_url}`}
                                    width={70}
                                    height={70}
                                    alt="Cast member"
                                />
                            )}
                            <div>
                                {member.pivot.character_name}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div>
                                {member.name}
                            </div>
                            {member.image_url && (
                                <Image
                                    src={`${member.image_url}`}
                                    width={70}
                                    height={70}
                                    alt="Cast member"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {cast.length > 6 && (
                <button
                onClick={() => setShowAll(!showAll)}
                className="mt-2 text-pink-700 hover:underline text-sm"
                >
                {showAll ? "Show Less" : `Show All (${cast.length})`}
                </button>
            )}
        </div>
    );
};

export default CastList;