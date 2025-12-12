import dbConnect from "@/lib/db";
import Revision from "@/models/Revision";
import "@/models/User";
import "@/models/Article";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getRevisions() {
    await dbConnect();

    const revisions = await Revision.find()
        .populate("userId", "name email")
        .populate("articleId", "title slug")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    return revisions;
}

export default async function RevisionsPage() {
    const revisions = await getRevisions();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Revisions Log</h1>
                <p className="text-zinc-500">Track all article changes and edits</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
                {revisions.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        No revisions recorded yet
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200">
                        {revisions.map((revision) => {
                            const userId = revision.userId as unknown as {
                                name?: string;
                                email?: string;
                            } | null;
                            const articleId = revision.articleId as unknown as {
                                title?: string;
                                slug?: string;
                            } | null;

                            return (
                                <div key={String(revision._id)} className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                        <div>
                                            <h3 className="font-medium text-zinc-900">
                                                {articleId?.title || "Unknown Article"}
                                            </h3>
                                            <p className="text-sm text-zinc-500">
                                                Edited by {userId?.name || "Unknown User"} on{" "}
                                                {formatDate(revision.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {Object.entries(revision.changes || {}).map(
                                            ([field, change]) => {
                                                const changeData = change as {
                                                    old: unknown;
                                                    new: unknown;
                                                };
                                                return (
                                                    <div
                                                        key={field}
                                                        className="text-sm bg-zinc-50 rounded p-3"
                                                    >
                                                        <span className="font-medium text-zinc-700">
                                                            {field}:
                                                        </span>
                                                        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <div className="bg-red-50 text-red-800 p-2 rounded text-xs overflow-auto">
                                                                <span className="font-medium">Old:</span>{" "}
                                                                {typeof changeData.old === "object"
                                                                    ? JSON.stringify(changeData.old)
                                                                    : String(changeData.old || "-")}
                                                            </div>
                                                            <div className="bg-green-50 text-green-800 p-2 rounded text-xs overflow-auto">
                                                                <span className="font-medium">New:</span>{" "}
                                                                {typeof changeData.new === "object"
                                                                    ? JSON.stringify(changeData.new)
                                                                    : String(changeData.new || "-")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
