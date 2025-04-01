import { TableCell, TableRow } from "@/components/ui/table";

export function Maintable({ quiz, topic }) {
  if (topic) {
    return (
      <TableRow key={topic.title}>
        <TableCell className="font-medium">{topic.title}</TableCell>
        <TableCell>{topic.learning_objectives}</TableCell>
        <TableCell>{topic.description}</TableCell>
        <TableCell className="text-right">{topic.code_snippet}</TableCell>
      </TableRow>
    );
  }

  if (quiz) {
    return (
      <TableRow key={quiz.title}>
        <TableCell className="font-medium">{quiz.title}</TableCell>
        <TableCell>{quiz.type}</TableCell>
        <TableCell>{quiz.explanation}</TableCell>
        <TableCell className="text-right">{quiz.correctAnswer}</TableCell>
      </TableRow>
    );
  }

  return null;
}
