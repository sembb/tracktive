'use client';
import React from 'react';
import { useState } from "react";

type CastListProps = {
    // Add props as needed, e.g. cast: Array<{ name: string; role: string; }>
};

const CastList: React.FC<CastListProps> = ({ cast }) => {
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? cast : cast.slice(0, 20);
    return (
        <div>
            <div className="flex gap-1 flex-wrap">
                {visible.map((member, i) => (
                <span key={i} className="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-pink-700/10 ring-inset">
                    {member.name} - {member.pivot.character_name}
                </span>
                ))}
            </div>

            {cast.length > 20 && (
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